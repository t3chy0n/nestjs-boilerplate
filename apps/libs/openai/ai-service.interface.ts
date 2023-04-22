import { Observable } from 'rxjs';

export abstract class IAIService {
  abstract query(q: string): Promise<string>;
}
