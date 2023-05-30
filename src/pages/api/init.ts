import fetch, { FormData, File } from 'node-fetch';
import type { NextApiRequest, NextApiResponse } from 'next';
import Blob from 'cross-blob';
import { _ } from '@/lib/lodash';

export interface InitProject {
  name: string;
  description: string;
  applets: Applet[];
  envs?: {
    env: [string, string][];
  };
  datas?: {
    cronJob?: {
      eventType: string;
      cronExpressions: string;
    };
    monitor?: Monitor;
  }[];
}

interface Applet {
  wasmURL?: string;
  wasmRaw?: string;
  appletName: string;
}
export interface ContractLog {
  eventType: string;
  chainID: number;
  contractAddress: string;
  blockStart: number;
  blockEnd: number;
  topic0: string;
}
export interface Monitor {
  contractLog?: ContractLog | ContractLog[];
  chainTx?: {
    eventType: string;
    chainID: number;
    txAddress: string;
  };
  chainHeight?: {
    eventType: string;
    chainID: number;
    height: number;
  };
}

const createProject = async (
  project: InitProject,
  token: string
): Promise<{
  projectID: string;
  projectName: string;
}> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/srv-applet-mgr/v0/project`, {
      method: 'post',
      body: JSON.stringify(project),
      headers: { Authorization: token }
    });
    if (response.status !== 200 && response.status !== 201) {
      throw new Error(response.statusText);
    }
    const data: any = await response.json();
    if (data.projectID) {
      return {
        projectID: data.projectID,
        projectName: data.name
      };
    }
    throw data;
  } catch (e) {
    throw new Error('create project failed:' + e.message);
  }
};

const createApplet = async ({ projectName, appletName, wasmURL, wasmRaw }: Applet & { projectName: string }, token: string): Promise<string> => {
  try {
    const formData = new FormData();
    let wasmName = '';
    if (wasmURL) {
      const response = await fetch(wasmURL);
      const blob = await response.blob();
      wasmName = wasmURL.split('/').pop();
      const file = new File([blob], wasmName, { type: 'application/wasm' });
      formData.set('file', file, wasmName);
    } else {
      // const file = dataURItoBlob(wasmRaw);
      const buffer = Buffer.from(wasmRaw.replace(/data:application\/wasm;(?:name=(.+)\.wasm);base64,/, ''), 'base64');
      wasmName = 'wasm_01';
      formData.set('file', new Blob([buffer], { type: 'application/wasm' }));
    }
    formData.set(
      'info',
      JSON.stringify({
        projectName,
        appletName,
        wasmName,
        start: true
      })
    );
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/srv-applet-mgr/v0/applet/x/${projectName}`, {
      method: 'post',
      headers: {
        Authorization: token
      },
      body: formData
    });
    if (res.status !== 200 && res.status !== 201) {
      throw new Error('create applet failed:' + res.statusText);
    }
    const data: any = await res.json();
    if (data.appletID) {
      return data.appletID;
    }
    throw data;
  } catch (e) {
    throw new Error('create applet failed');
  }
};

const createMonitor = async (projectName: string, monitor: Monitor, token: string): Promise<void> => {
  try {
    if (monitor.contractLog) {
      if (Array.isArray(monitor.contractLog)) {
        const res = await Promise.all(
          monitor.contractLog.map((i) => {
            return fetch(`${process.env.NEXT_PUBLIC_API_URL}/srv-applet-mgr/v0/monitor/x/${projectName}/contract_log`, {
              method: 'post',
              body: JSON.stringify(i),
              headers: { Authorization: token }
            });
          })
        );
        if (res.some((i) => i.status != 200 && i.status !== 201)) {
          throw new Error('create monitor failed:' + res[0].statusText);
        }
      } else {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/srv-applet-mgr/v0/monitor/x/${projectName}/contract_log`, {
          method: 'post',
          body: JSON.stringify(monitor.contractLog),
          headers: { Authorization: token }
        });
        if (res.status !== 200 && res.status !== 201) {
          throw new Error('create monitor failed:' + res.statusText);
        }
      }
    }
    if (monitor.chainTx) {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/srv-applet-mgr/v0/monitor/x/${projectName}/chain_tx`, {
        method: 'post',
        body: JSON.stringify(monitor.chainTx),
        headers: { Authorization: token }
      });
      if (res.status !== 200 && res.status !== 201) {
        throw new Error('create monitor failed:' + res.statusText);
      }
    }
    if (monitor.chainHeight) {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/srv-applet-mgr/v0/monitor/x/${projectName}/chain_height`, {
        method: 'post',
        body: JSON.stringify(monitor.chainHeight),
        headers: { Authorization: token }
      });
      if (res.status !== 200 && res.status !== 201) {
        throw new Error('create monitor failed:' + res.statusText);
      }
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

const createCronJob = async (
  projectId: string,
  data: {
    eventType: string;
    cronExpressions: string;
  },
  token: string
) => {
  try {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/srv-applet-mgr/v0/cronjob/${projectId}`, {
      method: 'post',
      body: JSON.stringify(data),
      headers: { Authorization: token }
    });
  } catch (error) {}
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  if (method === 'POST') {
    const token = req.headers.authorization.replace('Bearer ', '');
    const project = req.body.project as InitProject[];
    if (!project) {
      res.status(400).json({ message: 'Bad Request' });
      return;
    }

    try {
      const createdProjectIds = [];
      for (const p of project) {
        const { projectID, projectName } = await createProject(p, token);
        createdProjectIds.push(projectID);
        for (const a of p.applets) {
          await createApplet({ ...a, projectName }, token);
        }
        for (const d of p.datas) {
          if (d.monitor) {
            await createMonitor(projectName, d.monitor, token);
          }
          if (d.cronJob) {
            await createCronJob(projectID, d.cronJob, token);
          }
        }
      }
      res.status(200).json({ message: 'OK', createdProjectIds });
    } catch (error) {
      res.status(500).json({ message: error.message });
      //todo: if create project failed, rollback all (delete project)
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
};

export default handler;
