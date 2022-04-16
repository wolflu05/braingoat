export enum COMMANDS {
  PLUS = "+",
  MINUS = "-",
  MOVE_POINTER_LEFT = "<",
  MOVE_POINTER_RIGHT = ">",
  PRINT = ".",
  INPUT = ",",
  LOOP_START = "[",
  LOOP_END = "]",
  MARKER = "#",
}

export const VALID_CHARS: string[] = Object.values(COMMANDS);
