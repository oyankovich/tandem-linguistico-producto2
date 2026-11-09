/* 
  USO DE IA GENERATIVA
  IA utilizada: Gemini
  Prompt 1: "Estruturame un array modular de exportación con los datos simulados de usuarios registrados y sus credenciales de acceso."
  Prompt 2: "Defineme un array estructurado de intercambios diferenciando claramente entre ofertas y peticiones con sus respectivos metadatos."
  Prompt 3: "Agrúpame los registros con información detallada de idiomas, niveles, modalidades, descripciones y fechas de publicación."
  Prompt 4: "Asociame cada intercambio de forma coherente con el correo y nombre del usuario propietario correspondiente del sistema."
*/

export const usuarios = [
    { id: 1, nombre: "Marina Soler", email: "marina.soler@uoc.edu", password: "123", idiomaNativo: "Español" },
    { id: 2, nombre: "Pau Riera", email: "pau.riera@uoc.edu", password: "123", idiomaNativo: "Catalán" },
    { id: 3, nombre: "Laia Ferrer", email: "laia.ferrer@uoc.edu", password: "123", idiomaNativo: "Catalán" },
    { id: 4, nombre: "Giorgio Bianchi", email: "giorgio.bianchi@uoc.edu", password: "123", idiomaNativo: "Italiano" },
    { id: 5, nombre: "Anna Weber", email: "anna.weber@uoc.edu", password: "123", idiomaNativo: "Alemán" },
    { id: 6, nombre: "Sara Esteve", email: "sara.esteve@uoc.edu", password: "123", idiomaNativo: "Español" }
];

export const intercambios = [
    // Ofertas (Azules)
    { id: 1, titulo: "Conversación en inglés", tipo: "oferta", idioma: "Inglés", nivel: "B2", modalidad: "Online", descripcion: "Ofrezco sesiones de conversación en inglés para nivel intermedio.", fecha: "2025-04-17", emailUsuario: "marina.soler@uoc.edu", nombreUsuario: "Marina Soler" },
    { id: 2, titulo: "Catalán para principiantes", tipo: "oferta", idioma: "Catalán", nivel: "C2", modalidad: "Presencial", descripcion: "Puedo ayudarte con catalán desde cero a cambio de conversación en alemán.", fecha: "2025-04-11", emailUsuario: "laia.ferrer@uoc.edu", nombreUsuario: "Laia Ferrer" },
    { id: 3, titulo: "Clases de alemán", tipo: "oferta", idioma: "Alemán", nivel: "C2", modalidad: "Online", descripcion: "Ofrezco alemán conversacional y corrección de textos para todos los niveles.", fecha: "2025-04-04", emailUsuario: "anna.weber@uoc.edu", nombreUsuario: "Anna Weber" },

    // Peticiones (Verdes)
    { id: 4, titulo: "Busco practicar francés", tipo: "peticion", idioma: "Francés", nivel: "A2", modalidad: "Online", descripcion: "Me gustaría practicar francés una tarde a la semana por videollamada.", fecha: "2025-04-14", emailUsuario: "pau.riera@uoc.edu", nombreUsuario: "Pau Riera" },
    { id: 5, titulo: "Intercambio español-italiano", tipo: "peticion", idioma: "Italiano", nivel: "B1", modalidad: "Presencial", descripcion: "Busco una persona nativa para ganar fluidez y compartir cultura.", fecha: "2025-04-08", emailUsuario: "giorgio.bianchi@uoc.edu", nombreUsuario: "Giorgio Bianchi" },
    { id: 6, titulo: "Preparación de japonés", tipo: "peticion", idioma: "Japonés", nivel: "A1", modalidad: "Online", descripcion: "Busco apoyo para preparar mi próximo viaje y aprender expresiones", fecha: "2025-04-02", emailUsuario: "sara.esteve@uoc.edu", nombreUsuario: "Sara Esteve" }
];
