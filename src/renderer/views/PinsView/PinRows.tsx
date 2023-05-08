// PinRows.tsx
import React, { useMemo } from 'react';
import { Button } from 'react-bootstrap';
import { bytesAsString, millisecondsAsString } from '../../../common/utils/unit-conversion.functions';
import PinCids from './PinCids';
import RefLink from '../../../main/RefLink';

export const pinRows = (pinList: any[], removePin: any) => {
  return (
    <>
      {pinList.map((pin) => {
          if(pin.meta) {
          console.log('pinRows.tsx pin: ', pin);
            const sizeBest = bytesAsString(pin.size);
            const expireText = pin.expire
              ? `In ${millisecondsAsString((pin.expire = new Date().getTime()))}`
              : 'Permanent';
            const pinDateText = pin.meta.pin_date ? new Date(pin.meta.pin_date).toLocaleString() : null;
            console.log('pinRows.tsx pinDateText: ', pinDateText);
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
                <td>{pin.size === 0 ? <strong>Pinning In Progress</strong> : sizeBest}</td>
                <td>
                  <Button variant="danger" onClick={() => removePin(pin._id)}>
                    X
                  </Button>
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
