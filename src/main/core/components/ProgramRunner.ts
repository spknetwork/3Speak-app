// ProgramRunner.ts
import { exec, ChildProcess } from 'child_process';
import treeKill from 'tree-kill';

class ProgramRunner {
  private command: string;
  private process: ChildProcess | null = null;
  private outputHandler: (data: string) => void;

  constructor(command: string, outputHandler: (data: string) => void) {
    this.command = command;
    this.outputHandler = outputHandler;
  }

  public setupProgram(onExit: () => void): void {
    console.log(`Setting up command: ${this.command}`);

    this.process = exec(this.command, (error, stdout, stderr) => {
      if (error && this.process && !this.process.killed) {
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
      this.process = null;
    });
  }

  public isRunning(): boolean {
    return this.process && !this.process.killed && this.process.exitCode === null;
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
      this.process = null;
    }
  }

  public cleanup(): void {
    this.stopProgram();
    // Remove event listeners here
  }
}

export default ProgramRunner;
