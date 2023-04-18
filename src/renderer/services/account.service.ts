import { convertLight } from './accountServices/convertLight'
import { createPost } from './accountServices/createPost'
import { followHandler } from './accountServices/followHandler'
import { getAccount } from './accountServices/getAccount'
import { getAccountBalances } from './accountServices/getAccountBalances'
import { getAccountMetadata } from './accountServices/getAccountMetadata'
import { getAccounts } from './accountServices/getAccounts'
import { getFollowerCount } from './accountServices/getFollowerCount'
import { getFollowing } from './accountServices/getFollowing'
import { getProfileAbout } from './accountServices/getProfileAbout'
import { getProfileBackgroundImageUrl } from './accountServices/getProfileBackgroundImageUrl'
import { getProfilePictureURL } from './accountServices/getProfilePictureURL'
import { login } from './accountServices/login'
import { logout } from './accountServices/logout'
import { permalinkToPostInfo } from './accountServices/permalinkToPostInfo'
import { permalinkToVideoInfo } from './accountServices/permalinkToVideoInfo'
import { postComment } from './accountServices/postComment'
import { updateMeta } from './accountServices/updateMeta'
import { voteHandler } from './accountServices/voteHandler'

export class AccountService {
  static convertLight = convertLight
  static createPost = createPost
  static followHandler = followHandler
  static getAccount = getAccount
  static getAccountBalances = getAccountBalances
  static getAccountMetadata = getAccountMetadata
  static getAccounts = getAccounts
  static getFollowerCount = getFollowerCount
  static getFollowing = getFollowing
  static getProfileAbout = getProfileAbout
  static getProfileBackgroundImageUrl = getProfileBackgroundImageUrl
  static getProfilePictureURL = getProfilePictureURL
  static login = login
  static logout = logout
  static permalinkToPostInfo = permalinkToPostInfo
  static permalinkToVideoInfo = permalinkToVideoInfo
  static postComment = postComment
  static updateMeta = updateMeta
  static voteHandler = voteHandler
}
