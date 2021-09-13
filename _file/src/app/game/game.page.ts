import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { GameProgram } from 'src/game/GameProgram';

@Component({
    selector: 'app-game',
    templateUrl: './game.page.html',
    styleUrls: ['./game.page.scss'],
})
export class GamePage implements AfterViewInit {

    @ViewChild("container") container: ElementRef;
    game: GameProgram;

    constructor() {
        this.game = new GameProgram();
    }

    public ngAfterViewInit() {
        this.container.nativeElement.appendChild( this.game.renderer.domElement );
        this.game.run();
    }

}
