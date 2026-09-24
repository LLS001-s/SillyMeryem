function typeWriter(element,text,speed=25){

  element.innerHTML="";

  let i=0;

  let finished=false;

  function typing(){

    if(i<text.length){

      element.innerHTML+=text.charAt(i);

      i++;

      setTimeout(typing,speed);

    }else{

      finished=true;

    }

  }

  typing();

  return{

    skip(){

      if(finished) return;

      element.innerHTML=text;

      finished=true;

    },

    isFinished(){

      return finished;

    }

  };

}
