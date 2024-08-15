import { LightningElement } from 'lwc';
import firsttemplate from './parentComp.html';
import secondtemplate from './childComp.html';

export default class ParentComp extends LightningElement {
    templatenumber = 'temp2';
    constructor(){
        super();
        console.log('Inside constructor with updated on chenge');
    }
    connectedCallback(){
        console.log('Inside connected callback');
    }
    disconnectedCallback(){
        console.log('Inside disconnected callback');
    }
    onchange(){
        console.log('i am appending something');
        const continer = this.template.querySelector('.container');
        for (let i = 0; i < 100; i++){
            const element = document.createElement('p');
            element.textContent = 'Item ' + i;
            continer.appendChild(element);
        }
    }
    render() {
        console.log('Inside render updated');
        if(this.templatenumber==='temp1')
            return firsttemplate;
        else return secondtemplate;
    }
}