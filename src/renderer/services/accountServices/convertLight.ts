export async function convertLight(val) {
  if (typeof val.json_metadata === 'object') {
    val.json_metadata = JSON.parse(val.json_metadata)
  }
  if (!val.json_metadata.video) {
    val.json_metadata.video = {
      info: {},
    }
  }
}