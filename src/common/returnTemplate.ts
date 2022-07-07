export class BrainamicResponseOk {
  status: 201 | 200;
  message: string;
  data: any;
}
export class BrainamicResponseError {
  status: number;
  message: string;
  error: any;
}
