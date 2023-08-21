// ProgramRunner.ts
import { spawn, SpawnOptions, ChildProcess } from 'child_process';
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

    const commandParts = this.command.split(' ');
    const cmd = commandParts[0];
    const args = commandParts.slice(1);

    const options: SpawnOptions = {
      stdio: 'pipe',
      detached: true, // This might help in some scenarios to open the program in a new process group.
      shell: true // Running in a shell can sometimes help with GUI apps.
    };

    this.process = spawn(cmd, args, options);

    this.process.stdout.on('data', (data) => {
      this.outputHandler(data.toString());
    });

    this.process.stderr.on('data', (data) => {
      this.outputHandler(data.toString());
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
