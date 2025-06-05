import { fetchRemoteConfig } from "./settings"
import feishuClient from "./vendors/feishuClient"

async function main() {
  await fetchRemoteConfig()
  const res = await feishuClient.getTableMetaDataFromUrl('https://8848-top.feishu.cn/wiki/wikcnUF3sZnNOvUFXHbvh0bVNFg?fromScene=spaceOverview&table=tblVbe0omB0xjf6D&view=vewaDel2YL')
  console.info(JSON.stringify(res, null, 2))
}

main().then(() => process.exit(0))
