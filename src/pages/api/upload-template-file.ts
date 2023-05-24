import fetch, { FormData, File } from 'node-fetch';
import type { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { projectName, appletName, appletId, wasmURL, uploadType } = req.body;
    if (!projectName || !appletName || !wasmURL || !uploadType) {
      res.status(400).json({ message: 'Bad Request' });
      return;
    }
    const token = req.headers.authorization.replace('Bearer ', '');
    try {
      const formData = new FormData();
      const response = await fetch(wasmURL);
      const blob = await response.blob();
      const wasmName = wasmURL.split('/').pop();
      const file = new File([blob], wasmName, { type: 'application/wasm' });
      formData.set('file', file, wasmName);
      formData.set(
        'info',
        JSON.stringify({
          projectName,
          appletName,
          wasmName,
          start: true
        })
      );
      if (uploadType === 'add') {
        const uploadRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/srv-applet-mgr/v0/applet/x/${projectName}`, {
          method: 'post',
          headers: {
            Authorization: token
          },
          body: formData
        });
        if (uploadRes.status !== 200 && uploadRes.status !== 201) {
          throw new Error('upload wasm failed:' + uploadRes.statusText);
        }
        const data: any = await uploadRes.json();
        res.status(200).json({ message: 'success', appletID: data.appletID });
      } else if (uploadType === 'update') {
        if (!appletId) {
          throw new Error('appletId is required');
        }
        const updatedRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/srv-applet-mgr/v0/applet/${appletId}`, {
          method: 'post',
          headers: {
            Authorization: token
          },
          body: formData
        });
        if (updatedRes.status !== 200 && updatedRes.status !== 201) {
          throw new Error('update wasm failed:' + updatedRes.statusText);
        }
        const data: any = await updatedRes.json();
        res.status(200).json({ message: 'success', resourceID: data.resourceID });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
};

export default handler;
