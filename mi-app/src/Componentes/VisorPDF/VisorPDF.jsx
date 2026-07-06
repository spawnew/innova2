import { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import SelectorArchivo from './SelectorArchivo';
import PanelHerramientas from './PanelHerramientas';
import HojaTexto from './HojaTexto';
import './style.css';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).href;

export default function VisorPdfPersonalizado() {
  const [lineasTexto, setLineasTexto] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [tamanioLetra, setTamanioLetra] = useState(16);
  const [colorFondo, setColorFondo] = useState('#ffffff');
  const [colorTexto, setColorTexto] = useState('#334155');
  const [textoGlobalSeleccionado, setTextoGlobalSeleccionado] = useState('');
  const [menuAbierto, setMenuAbierto] = useState(false);

  // 🌟 NUEVOS ESTADOS PARA EL MENÚ CONTEXTUAL Y LA REPRODUCCIÓN
  const [menuPosicion, setMenuPosicion] = useState(null); 
  const [reproduciendoSeleccion, setReproduciendoSeleccion] = useState(false);

  const procesarPDF = async (evento) => {
    const archivo = evento.target.files[0];
    if (!archivo) return;
    setCargando(true);
    try {
      const arrayBuffer = await archivo.arrayBuffer();
      const documentoPdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let textoAcumulado = '';

      for (let i = 1; i <= documentoPdf.numPages; i++) {
        const pagina = await documentoPdf.getPage(i);
        const contenidoTexto = await pagina.getTextContent();
        const textoPagina = contenidoTexto.items.map(item => item.str).join(' ');
        textoAcumulado += textoPagina + '\n';
      }

      const lineas = textoAcumulado.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      setLineasTexto(lineas);
    } catch (error) {
      console.error("Error al procesar el PDF:", error);
    } finally {
      setCargando(false);
    }
  };

  const leerTexto = () => {
    speechSynthesis.cancel();
    const textoCompleto = lineasTexto.join(' ');
    const voz = new SpeechSynthesisUtterance(textoCompleto);
    voz.lang = "es-ES";
    speechSynthesis.speak(voz);
  };

  // 🌟 REPRODUCE LA SELECCIÓN Y CONFIGURA EL CIERRE AUTOMÁTICO AL TERMINAR
  const leerTextoSeleccionado = (texto) => {
    speechSynthesis.cancel();
    const voz = new SpeechSynthesisUtterance(texto);
    voz.lang = "es-ES";
    
    voz.onstart = () => setReproduciendoSeleccion(true);
    voz.onend = () => setReproduciendoSeleccion(false);
    voz.onerror = () => setReproduciendoSeleccion(false);

    speechSynthesis.speak(voz);
    setMenuPosicion(null); // Ocultamos el menú flotante al darle play
  };

  const detenerTexto = () => {
    speechSynthesis.cancel();
    setReproduciendoSeleccion(false);
  };

  const aplicarTema = (fondo, texto) => {
   
    setColorFondo(fondo);
    setColorTexto(texto);
  };

  return (
    <div className="visor-container" style={{ padding: '20px' }} onClick={() => setMenuPosicion(null)}>
      
      <SelectorArchivo cargando={cargando} alProcesarPDF={processed => procesarPDF(processed)} />

      {lineasTexto.length > 0 && (
        <>
          <div style={{ margin: '15px 0', textAlign: 'right' }}>
            <button className="boton-accesible" onClick={() => setMenuAbierto(true)}>
              ⚙️ Configuración Accesibilidad
            </button>
          </div>

          
          {reproduciendoSeleccion && (
            <div style={{
              position: 'fixed',
              bottom: '20px',
              right: '20px',
              zIndex: 2000,
              boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
            }}>
              <button className="boton-dinamico" onClick={detenerTexto}>
                🛑 Detener 
              </button>
            </div>
          )}

        
          {menuPosicion && (
            <div style={{
              position: 'fixed',
              top: `${menuPosicion.y}px`,
              left: `${menuPosicion.x}px`,
              background: '#22252a',
              color: '#fff',
              border: '1px solid #444',
              borderRadius: '6px',
              padding: '5px 0',
              zIndex: 1500,
              boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
            }}
            onClick={(e) => e.stopPropagation()} // Evita que se cierre al clickear dentro
            >
              <button 
                className="boton-dinamico-escuchar" 
                
                onClick={() => leerTextoSeleccionado(textoGlobalSeleccionado)}
              >
                📢 Escuchar 
              </button>
            </div>
          )}

          <PanelHerramientas
            show={menuAbierto}
            handleClose={() => setMenuAbierto(false)}
            tamanioLetra={tamanioLetra}
            setTamanioLetra={setTamanioLetra}
            alEscuchar={leerTexto}
            alDetener={detenerTexto}
            aplicarTema={aplicarTema}
          />

          <HojaTexto
            lineasTexto={lineasTexto}
            colorFondo={colorFondo}
            colorTexto={colorTexto}
            tamanioLetra={tamanioLetra}
            setTextoGlobalSeleccionado={setTextoGlobalSeleccionado}
            setMenuPosicion={setMenuPosicion}
          />
        </>
      )}
    </div>
  );
}