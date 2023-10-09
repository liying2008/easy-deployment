import * as fs from 'node:fs'
import * as path from 'node:path'
import * as archiver from 'archiver'
import { outputMsg } from './panel'

/**
 * 打包并压缩文件
 * @param sourcePath 待压缩的文件路径
 * @param outputPath 压缩后的输出文件（含路径）
 * @param isFile 待压缩的是否是文件
 * @param exclude 需要排除的文件列表
 */
export function compress(sourcePath: string, outputPath: string, isFile: boolean, exclude: string[]) {
  const output = fs.createWriteStream(outputPath)
  const archive = archiver('tar', {
    gzip: true,
    gzipOptions: {
      level: 5,
    },
  })

  // 显示当前正在压缩的文件
  archive.on('entry', (entry: archiver.EntryData) => {
    const entryName = entry.name
    // console.log(`Compressing file: ${entryName}`);
    outputMsg(`Compressing file: ${entryName}`)
  })

  // good practice to catch this error explicitly
  archive.on('error', (err) => {
    console.log('compress error: ', err)
    throw err
  })

  archive.pipe(output)
  if (isFile) {
    const sourceName = path.parse(sourcePath).base
    archive.file(sourcePath, { name: sourceName })
  } else {
    // dot set true to include hidden files
    archive.glob('**/*', { cwd: sourcePath, ignore: exclude, dot: true })
  }
  return archive.finalize()
}
