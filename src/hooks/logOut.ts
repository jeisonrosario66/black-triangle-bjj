import { signOut } from "firebase/auth";
import useUIStore from "@src/store/useCounterStore"; 
import { auth } from "@src/hooks/fireBase"

const defaultUserLoginData = {
  displayName: "",
  email: "",
  photoURL: ""
}

// Función para manejar el cierre de sesión
const handleLogout = async () => {
  try {
    await signOut(auth);
    useUIStore.setState({ userLoginData: defaultUserLoginData, isUserLogin: false });
    
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  }
};

export default handleLogout
