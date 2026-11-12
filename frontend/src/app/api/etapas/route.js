import { encaminhar } from "../../../lib/apiAdm";

export function GET() {
  return encaminhar("/etapas");
}
