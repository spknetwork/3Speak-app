import { VideoService } from '../../../services/video.service';

export async function mountPlayer(reflink: string, setVideoLink: (link: string) => void, recordView: () => void) {
  try {
    const playerType = 'standard';
    switch (playerType) {
      case 'standard': {
        setVideoLink(await VideoService.getVideoSourceURL(reflink));
      }
    }
    recordView();
  } catch (ex) {
    console.error(ex);
  }
}
