import { fetchRemoteConfig } from "./settings"
import difyClient from "./vendors/dify"
import feishuClient from "./vendors/feishuClient"

async function main() {
  // await fetchRemoteConfig()
  // const res = await feishuClient.getTableMetaDataFromUrl('https://8848-top.feishu.cn/wiki/wikcnUF3sZnNOvUFXHbvh0bVNFg?fromScene=spaceOverview&table=tblVbe0omB0xjf6D&view=vewaDel2YL')
  // console.info(JSON.stringify(res, null, 2))

  const result = await difyClient.genCronExpression('每个月的周三晚上21点18分21秒')
  console.info(result)
}

main().then(() => process.exit(0))
