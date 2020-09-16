import * as fs from 'fs';
import * as path from 'path';
import * as archiver from 'archiver';


/**
 * 打包并压缩文件
 * @param sourcePath 待压缩的文件路径
 * @param outputPath 压缩后的输出文件（含路径）
 */
export function compress(sourcePath: string, outputPath: string) {
    let output = fs.createWriteStream(outputPath);
    let archive = archiver('tar', {
        gzip: true,
        gzipOptions: {
            level: 5
        }
    });
    archive.pipe(output);
    archive.directory(sourcePath, path.basename(sourcePath));
    return archive.finalize();
}
