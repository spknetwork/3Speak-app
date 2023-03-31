import { exec, ChildProcess } from 'child_process';
import treeKill from 'tree-kill'
class ProgramRunner {
  private command: string;
  private process: ChildProcess | null = null;
  private outputHandler: (data: string) => void;

  constructor(command: string, outputHandler: (data: string) => void) {
    this.command = command;
    this.outputHandler = outputHandler;
  }
  public runProgram(onExit: () => void): void {
    console.log(`Running command: ${this.command}`);

    this.process = exec(this.command, (error, stdout, stderr) => {
      if (error && !this.process.killed) {
        console.error(`Error running program: ${error.message}`);
        console.error('Error details:', error);
        return;
      }

      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
    });
    this.process.stdout.on('data', (data) => {
      this.outputHandler(data);
    });

    this.process.stderr.on('data', (data) => {
      this.outputHandler(data);
    });

    this.process.on('exit', () => {
      onExit();
    });
  }

  public isRunning(): boolean {
    return this.process !== null && !this.process.killed;
  }
  public stopProgram(): void {
    if (this.process) {
      try {
        treeKill(this.process.pid, 'SIGINT');
      } catch (error) {
        if (error.code !== 'ESRCH') {
          console.error('Error stopping program:', error);
        }
      }
    }
  }
}

export default ProgramRunner;
