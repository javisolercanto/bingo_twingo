import { clearModal, showModal } from '../core';
import { app } from '../../main.js';
import '../../css/modalMainMenu.css';
import * as utils from '..//utils.js'
import { modalPlayers } from './modalPlayers';
import settings from '../../../settings';
import { translator } from '../translator';

export const modalMainMenu = () => {

    const controllers = () => {
        //setup the video
        clearModal('bg')
        utils.setupBackgroundVideo();

        if (!settings.enableOffline) {
            localStorage.setItem('onlineUsername', alert('Insert an online username'));
            app.online();
        }
        
        if (localStorage.getItem('onlineUsername') != '' || localStorage.getItem('onlineUsername') != undefined){
            document.getElementById('usernameP').value = localStorage.getItem('onlineUsername');
        }
       
        document.getElementById('playOnline').onclick = function () {
            if(utils.checkName(document.getElementById('usernameP').value)){
                localStorage.setItem('onlineUsername',document.getElementById('usernameP').value);
                app.online();
            }else{
                document.getElementById('msg--err').innerHTML = "\u26A0  Name not allowed!"
            }
        }

        // Offline Game
        document.getElementById('playOffline').onclick = function () {
            showModal(modalPlayers(), app.offline)
        }
    }

    return {
        template:
            `
            <div id="mainMenu" class="modal">
                <!-- Modal content -->
                <div class="modal-content">
                    <h1>BINGO TWINGO</h1>
                    <p></p>
                    <input class="input_player_online" type="text" id="usernameP" name="usernameP" i18n-placeholder placeholder="Online username:">
                    <p class="msg--error" id="msg--err"></p>
                    <div class="menu__options">
                        <button id='playOffline' class="mainMenu__btn menu__offline_btn" i18n>Start Offline Game</button>
                        <button id='playOnline' class="mainMenu__btn menu__online_btn" i18n>Search Online Game</button>
                    </div>
                    
                </div>
            </div>`,
        controllers: controllers
    }
}