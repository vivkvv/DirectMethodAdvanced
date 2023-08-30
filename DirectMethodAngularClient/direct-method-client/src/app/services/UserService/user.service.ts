import { BehaviorSubject } from 'rxjs';

export class UserService {
    public username = new BehaviorSubject<string>(undefined!);

    setUsername(newName: string) {
        this.username.next(newName);
    }
}
