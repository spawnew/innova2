
import './App.css'
import { ColorProvider } from './Context/fondoContext';
import Navbar from './Componentes/Navbar/Navbar.jsx'

import VisorPDF from './Componentes/VisorPDF/VisorPDF.jsx';
function App() {
 

  return (
    <>
      <Navbar />
    
      <ColorProvider>
        
  
      <VisorPDF />
        
  
      </ColorProvider>
     
    </>
  )
}

export default App
