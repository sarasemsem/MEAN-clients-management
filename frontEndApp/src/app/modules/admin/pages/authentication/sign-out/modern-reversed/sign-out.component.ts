import { I18nPluralPipe, NgIf } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { AuthService } from '@fuse/auth/service/auth.service';

@Component({
    selector     : 'sign-out-modern-reversed',
    templateUrl  : './sign-out.component.html',
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations,
    standalone   : true,
    imports      : [NgIf, RouterLink, I18nPluralPipe],
})
export class SignOutModernReversedComponent
{
    countdown: number = 5;
    countdownMapping: any = {
        '=1'   : '# second',
        'other': '# seconds',
    };

    /**
     * Constructor
     */
    constructor(
        private _authService: AuthService,
        private _router: Router,
    )
    {
    }
}
