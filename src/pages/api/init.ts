import fetch, { FormData, File } from 'node-fetch';
import type { NextApiRequest, NextApiResponse } from 'next';
import Blob from 'cross-blob';
import { _ } from '@/lib/lodash';

export interface InitProject {
  name: string;
  description: string;
  applets: Applet[];
  database?: {
    schemas: any[];
  };
  envs?: {
    env: [string, string][];
  };
  datas?: {
    publisher?: {
      key: string;
    };
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

interface Monitor {
  contractLog?: {
    eventType: string;
    chainID: number;
    contractAddress: string;
    blockStart: number;
    blockEnd: number;
    topic0: string;
  };
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
    // console.log('createApplet->', data);
    if (data.appletID) {
      return data.appletID;
    }
    throw data;
  } catch (e) {
    throw new Error('create applet failed');
  }
};

const createMonitor = async (projectName: string, monitor: Monitor, token: string): Promise<void> => {
  if (monitor.contractLog) {
    monitor.contractLog.chainID = Number(monitor.contractLog.chainID);
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/srv-applet-mgr/v0/monitor/x/${projectName}/contract_log`, {
      method: 'post',
      body: JSON.stringify(monitor.contractLog),
      headers: { Authorization: token }
    });
  }

  if (monitor.chainTx) {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/srv-applet-mgr/v0/monitor/x/${projectName}/chain_tx`, {
      method: 'post',
      body: JSON.stringify(monitor.chainTx),
      headers: { Authorization: token }
    });
  }

  if (monitor.chainHeight) {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/srv-applet-mgr/v0/monitor/x/${projectName}/chain_height`, {
      method: 'post',
      body: JSON.stringify(monitor.chainHeight),
      headers: { Authorization: token }
    });
  }
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
      for (const p of project) {
        const { projectName } = await createProject(p, token);
        for (const a of p.applets) {
          await createApplet({ ...a, projectName }, token);
        }
        for (const d of p.datas) {
          if (d.monitor) {
            await createMonitor(projectName, d.monitor, token);
          }
        }
      }
      res.status(200).json({ message: 'OK' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
};

export default handler;
