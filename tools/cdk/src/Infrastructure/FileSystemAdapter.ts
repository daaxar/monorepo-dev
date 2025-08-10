import * as path from "node:path";
import * as os from "os";
import * as fs from "fs";
import * as child_process from "child_process";
import zip from "adm-zip";

export class FileSystemAdapter {
  async createLayerZip(name: string, deps: string[]): Promise<string> {
    const tmpDir = path.join(os.tmpdir(), "stackFactory", name);
    const nodeModulesDir = path.join(tmpDir, "nodejs", "node_modules");
    const zipFilePath = path.join(tmpDir, `${name}.zip`);

    if (fs.existsSync(tmpDir))
      fs.rmSync(tmpDir, { recursive: true, force: true });
    fs.mkdirSync(nodeModulesDir, { recursive: true });

    const npmInstallCmd = `npm install ${deps.join(" ")} --prefix ${path.join(tmpDir, "nodejs")}`;
    child_process.execSync(npmInstallCmd, { stdio: "inherit" });

    const zipFile = new zip();
    zipFile.addLocalFolder(path.join(tmpDir, "nodejs"), "nodejs");
    zipFile.writeZip(zipFilePath);

    return zipFilePath;
  }
}
