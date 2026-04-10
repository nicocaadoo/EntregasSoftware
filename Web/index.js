console.log("Hola desde console")
let cont=1;
function traduce(){
    if(cont%2==0){
        parrafo=document.getElementById("parrafo1");
        parrafo.innerHTML="A cat café is a theme café whose attraction is cats who can be watched and played with. Patrons pay a cover fee, generally hourly, and thus cat cafés can be seen as a form of supervised indoor pet rental.";
    }
    else{
        parrafo=document.getElementById("parrafo1");
        parrafo.innerHTML="Un café de gatos es un café temático cuya atracción son los gatos que se pueden observar y con los que se puede jugar.[1] Los clientes pagan una entrada, generalmente por hora, por lo que los cafés de gatos pueden considerarse una forma de alquiler supervisado de mascotas en interiores.";
    }
    cont++;  
}
let gatos=[{nombre:"Benito Bodoque", imagen:"https://static.wikia.nocookie.net/idkcatmemes/images/e/e6/Rigby_the_kitty.jpg/revision/latest?cb=20260110200119"},
    {nombre: "Cucho", imagen: "https://www.terapiafelina.com/wp-content/uploads/2021/12/GB09_348_Moway-4-1024x680.jpg"},
    {nombre: "Don Gato", imagen: "https://moderncat.com/wp-content/uploads/2014/03/bigstock-46771525_Andrey_Kuzmin-1-940x640.jpg"}]

let indice = 0;
function cambio(){
    indice++;
    if(indice>=gatos.length){
        indice=0;
    }
    document.getElementById("gato").textContent = gatos[indice].nombre;
    document.getElementById("imagen").src = gatos[indice].imagen;
}
let oscuro = false;
function Dark(){
    if(oscuro == false){
        document.body.style.backgroundColor = "#070764"
        oscuro = true;
    } else{
        document.body.style.backgroundColor = "#adadf4"
        oscuro = false;
    }

}
