export class GridFeedQueryService {
  static getFeedSql(feedType: string, offset = 0): string {
    if (feedType === 'new') {
      return `SELECT x.* FROM DBHive.dbo.Comments x WHERE CONTAINS(json_metadata , '3speak/video') AND created  >= DATEADD(day,-10,GETDATE()) ORDER BY ID DESC OFFSET ${offset} ROWS FETCH NEXT 25 ROWS ONLY`
    } else if (feedType === 'trending') {
      return `SELECT x.* FROM DBHive.dbo.Comments x WHERE CONTAINS(json_metadata , '3speak/video') AND created  >= DATEADD(day,-10,GETDATE()) ORDER BY total_vote_weight DESC OFFSET ${offset} ROWS FETCH NEXT 25 ROWS ONLY`
    } else if (feedType[0] === '@') {
      const author = feedType.substring(1)
      return `SELECT x.* FROM DBHive.dbo.Comments x WHERE CONTAINS(json_metadata , '3speak/video') AND author LIKE '${author}' ORDER BY ID DESC OFFSET ${offset} ROWS FETCH NEXT 25 ROWS ONLY`
    } else if (feedType[0] === '#') {
      const catString = feedType.substring(1)
      const category = catString.split('/')
      return `SELECT x.* FROM DBHive.dbo.Comments x WHERE CONTAINS(json_metadata , '3speak/video') AND category LIKE '${
        category[0]
      }' ORDER BY ${
        category[1] === 'trending' ? 'total_vote_weight' : 'ID'
      } DESC OFFSET 0 ROWS FETCH NEXT 25 ROWS ONLY`
    } else {
      throw new Error(`Could not get sql for unrecognized feed type ${feedType}`)
    }
  }
}
