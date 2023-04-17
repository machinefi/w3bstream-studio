import fetch, { FormData, File } from 'node-fetch';
import type { NextApiRequest, NextApiResponse } from 'next';
import Blob from 'cross-blob';

export interface Project {
  name: string;
  description: string;
  applets: Applet[];
  datas?: {
    monitor: Monitor;
  }[];
  envs?: string[][];
  schema?: {
    [x: string]: any;
  };
}

interface Applet {
  wasmURL?: string;
  wasmRaw?: string;
  appletName: string;
}

interface Monitor {
  contractLog: {
    eventType: string;
    chainID: number;
    contractAddress: string;
    blockStart: number;
    blockEnd: number;
    topic0: string;
  };
  chainTx: {
    eventType: string;
    chainID: number;
    txAddress: string;
  };
  chainHeight: {
    eventType: string;
    chainID: number;
    height: number;
  };
}

const createProject = async (
  project: Project,
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
    const data: any = await response.json();
    if (data.project) {
      return {
        projectID: data.project.projectID,
        projectName: data.project.name
      };
    }
  } catch (e) {
    console.log(e);
    throw new Error('create project failed:' + e.msg);
  }
};

// const saveEnvs = async (projectName: string, envs: string[][], token: string): Promise<void> => {
//   await fetch(`${process.env.NEXT_PUBLIC_API_URL}/srv-applet-mgr/v0/project_config/${projectName}/PROJECT_ENV`, {
//     method: 'post',
//     body: JSON.stringify({
//       env: envs
//     }),
//     headers: { Authorization: token }
//   });
// };

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
        wasmName
      })
    );
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/srv-applet-mgr/v0/applet/${projectName}`, {
      method: 'post',
      headers: {
        Authorization: token
      },
      body: formData
    });
    const data: any = await res.json();
    if (data.appletID) {
      return data.appletID;
    }
    throw data;
  } catch (e) {
    console.log(e.message)
    throw new Error('create applet failed');
  }
};

const deployApplet = async (appletID: string, token: string): Promise<string> => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/srv-applet-mgr/v0/deploy/applet/${appletID}`, {
      method: 'post',
      headers: {
        Authorization: token
      }
    });
    const data: any = await res.json();
    if (data.instanceID) {
      return data.instanceID;
    }
    throw data;
  } catch (error) {
    console.log(error);
    throw new Error('deploy applet failed:' + error.msg);
  }
};

const startInstance = async (instanceID: string, token: string): Promise<any> => {
  try {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/srv-applet-mgr/v0/deploy/${instanceID}/START`, {
      method: 'put',
      headers: {
        Authorization: token
      }
    });
  } catch (error) {
    console.log(error);
    throw new Error('start instance failed:'+error.msg);
  }
};

const createMonitor = async (projectName: string, monitor: Monitor, token: string): Promise<void> => {
  if (monitor.contractLog) {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/srv-applet-mgr/v0/monitor/contract_log/${projectName}`, {
      method: 'post',
      body: JSON.stringify({
        projectName,
        ...monitor.contractLog
      }),
      headers: { Authorization: token }
    });
  }

  if (monitor.chainTx) {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/srv-applet-mgr/v0/monitor/chain_tx/${projectName}`, {
      method: 'post',
      body: JSON.stringify({
        projectName,
        ...monitor.chainTx
      }),
      headers: { Authorization: token }
    });
  }

  if (monitor.chainHeight) {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/srv-applet-mgr/v0/monitor/chain_height/${projectName}`, {
      method: 'post',
      body: JSON.stringify({
        projectName,
        ...monitor.chainHeight
      }),
      headers: { Authorization: token }
    });
  }
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  if (method === 'POST') {
    const token = req.headers.authorization.replace('Bearer ', '');
    const project = req.body.project as Project[];
    if (!project) {
      res.status(400).json({ message: 'Bad Request' });
      return;
    }

    try {
      for (const p of project) {
        const { projectID, projectName } = await createProject(p, token);
        // if (p.envs?.length > 0) {
        //   await saveEnvs(projectName, p.envs, token);
        // }
        for (const a of p.applets) {
          const appletID = await createApplet({ ...a, projectName }, token);
          const instanceID = await deployApplet(appletID, token);
          await startInstance(instanceID, token);
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
