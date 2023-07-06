import React from 'react';
import { bytesAsString, millisecondsAsString } from '../../../common/utils/unit-conversion.functions'
import RefLink from '../../../main/RefLink'
import { IoIosRadioButtonOn } from 'react-icons/io'
import PinCids from './PinCids'
import { Button } from 'react-bootstrap'

export const pinRows = (pinList: any[], removePin: any) => {
  const [cidStatus, setCidStatus] = React.useState({});
  console.log('pinRows.tsx cidStatus: ', cidStatus);
  const fetchCIDStatus = async (cid) => {
    let firstCid;
    if (Array.isArray(cid)) {
      firstCid = cid[0];
    } else {
      firstCid = cid.split(',')[0];
    }
    console.log('pinRows.tsx fetchCIDStatus cid: ', firstCid);
    const response = await fetch(`http://spk.tv/CID?key=${firstCid}`);
    console.log('pinRows.tsx fetchCIDStatus response: ', response);
    const data = await response.json();
    return data;
  };

  React.useEffect(() => {
    const intervalId = setInterval(async () => {
      const newCidStatus = {};
      for (let pin of pinList) {
        if (pin.meta) {
          const status = await fetchCIDStatus(pin.cids);
          console.log('pinRows.tsx status: ', status);
          newCidStatus[pin.cids] = status;
        }
      }
      setCidStatus(newCidStatus);
    }, 3000); // Every 30 seconds

    return () => clearInterval(intervalId); // Clear interval on unmount
  }, [pinList]);

  return (
    <>
      {pinList.map((pin) => {
        if(pin.meta) {
          const sizeBest = bytesAsString(pin.size);
          const expireText = pin.expire
            ? `In ${millisecondsAsString((pin.expire = new Date().getTime()))}`
            : 'Permanent';
          const pinDateText = pin.meta.pin_date ? new Date(pin.meta.pin_date).toLocaleString() : null;
          const currentStatus = cidStatus[pin.cids];
            return (
              <tr key={pin._id}>
                <td>
                  <a href={`#/watch/${pin._id}`}>{pin._id}</a>
                  <br />(<strong>{RefLink.parse(pin._id).root}</strong>)
                </td>
                <td>
                  <a href={`#/watch/${pin._id}`}>{pin.meta ? pin.meta.title : null} </a>
                </td>
                <td>
                  <PinCids pin={pin} />
                </td>
                <td>{pin.source}</td>
                <td>{expireText}</td>
                <td>{pinDateText}</td>
                <td>{pin.size === 0 ? <strong>Pinning In Progress {pin.percent}%</strong> : sizeBest}</td>
                <td>
                  <Button variant="danger" onClick={() => removePin(pin._id)}>
                    X
                  </Button>
                </td>
                <td>
                  <IoIosRadioButtonOn style={{ color: currentStatus && currentStatus.status ? 'green' : 'red' }} />
                  {currentStatus && `${currentStatus.percentage}%`}
                </td>
              </tr>
            );

          }else {
            console.log('pinRows.tsx pin is null');
          }
      })}
    </>
  );
};
