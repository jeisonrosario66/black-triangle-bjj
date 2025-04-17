
import { onAuthStateChanged } from "firebase/auth";
import useUIStore from "@src/store/useCounterStore";
import { auth } from "@src/hooks/fireBase"

// Función para iniciar el listener de autenticación
const startAuthListener = () => {
  // Datos predeterminados para un usuario no autenticadoconst startAuthListener = () => {

  const defaultUserLoginData = {
    displayName: "",
    email: "",
    photoURL: ""
  }

  // Escucha los cambios en el estado de autenticación
  onAuthStateChanged(auth, (user) => {
    if (user) {
      useUIStore.setState({ userLoginData: user, isUserLogin: true });
    } else {
      useUIStore.setState({ userLoginData: defaultUserLoginData, isUserLogin: false });
    }
  });
};

export default startAuthListener