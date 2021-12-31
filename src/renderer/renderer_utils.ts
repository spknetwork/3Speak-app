import hive from '@hiveio/hive-js'
import { promisify } from 'util'

hive.broadcast.comment = promisify(hive.broadcast.comment)

export class FormUtils {
  static formToObj(formData: any): any {
    const out = {}
    for (const key of formData.keys()) {
      out[key] = formData.get(key)
    }
    return out
  }
}
