const canvas = document.querySelector('canvas');

const worker = new Worker('./worker.js');


document.querySelector('button').addEventListener('click' , ()=>{
    const ctx = canvas.getContext('2d');
    ctx.font = '30px serif';
    ctx.fillText('Hello Worker' , 0 , 90);
})