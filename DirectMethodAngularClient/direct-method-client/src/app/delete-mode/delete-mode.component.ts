import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { finalize } from 'rxjs/operators';
import { UserService } from '../services/UserService/user.service';

@Component({
    selector: 'delete-mode',
    templateUrl: './delete-mode.component.html',
    styleUrls: ['./delete-mode.component.css'],
})
export class DeleteModeComponent {
    constructor(
        private dialogRef: MatDialogRef<DeleteModeComponent>,
        private router: Router,
        private userService: UserService
    ) {}

    close(): void {
        this.dialogRef.close(false);
    }

    deleteMode(): void {       
        this.dialogRef.close(true);        
    }
}
