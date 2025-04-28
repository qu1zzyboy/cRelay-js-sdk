// Action represents the permission action type
export enum Action {
  Read = 1 << 0,   // 1
  Write = 1 << 1,  // 2
  Execute = 1 << 2 // 4
}

// AuthTag represents the auth tag structure
export class AuthTag {
  Action: Action; // Permission mask (1=read, 2=write, 4=execute)
  Key: number;    // Causality key ID
  Exp: number;    // Expiration clock value

  constructor(action: Action, key: number, exp: number) {
      this.Action = action;
      this.Key = key;
      this.Exp = exp;
  }

  // ParseAuthTag parses an auth tag string into an AuthTag instance
  static parseAuthTag(authStr: string): AuthTag {
      const parts = authStr.split(",");
      if (parts.length !== 3) {
          throw new Error(`invalid auth tag format: ${authStr}`);
      }

      const auth = new AuthTag(Action.Read, 0, 0); // Initialize with default values

      for (const part of parts) {
          const kv = part.split("=");
          if (kv.length !== 2) {
              throw new Error(`invalid auth tag part: ${part}`);
          }

          switch (kv[0].trim()) {
              case "action":
                  const action = parseInt(kv[1], 10);
                  if (isNaN(action) || action < 0 || action > 7) { // Check for valid Action values
                      throw new Error(`invalid action value: ${kv[1]}`);
                  }
                  auth.Action = action as Action;
                  break;
              case "key":
                  const key = parseInt(kv[1], 10);
                  if (isNaN(key)) {
                      throw new Error(`invalid key value: ${kv[1]}`);
                  }
                  auth.Key = key;
                  break;
              case "exp":
                  const exp = parseInt(kv[1], 10);
                  if (isNaN(exp)) {
                      throw new Error(`invalid exp value: ${kv[1]}`);
                  }
                  auth.Exp = exp;
                  break;
              default:
                  throw new Error(`unknown auth tag field: ${kv[0]}`);
          }
      }

      return auth;
  }

  // String returns the string representation of an AuthTag
  toString(): string {
      return `action=${this.Action},key=${this.Key},exp=${this.Exp}`;
  }

  // HasPermission checks if the auth tag has the specified permission
  hasPermission(action: Action): boolean {
      return (this.Action & action) !== 0;
  }

  // IsExpired checks if the auth tag is expired based on the current clock value
  isExpired(currentClock: number): boolean {
      return this.Exp <= currentClock;
  }
}