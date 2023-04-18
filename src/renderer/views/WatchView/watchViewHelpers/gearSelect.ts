import PromiseIpc from 'electron-promise-ipc';

export async function gearSelect(eventKey: string, reflinkParsed: any) {
  switch (eventKey) {
    case 'mute_post': {
      await PromiseIpc.send('blocklist.add', reflinkParsed.toString());
      break;
    }
    case 'mute_user': {
      await PromiseIpc.send(
        'blocklist.add',
        `${reflinkParsed.source.value}:${reflinkParsed.root}` as any,
      );
      break;
    }
  }
}
