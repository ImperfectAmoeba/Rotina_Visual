// Senha do dispositivo para sair do modo de apenas visualização (RF008).
import * as LocalAuthentication from 'expo-local-authentication';

export const aparelhoTemSenha = async () => {
  const nivel = await LocalAuthentication.getEnrolledLevelAsync();
  return nivel !== LocalAuthentication.SecurityLevel.NONE;
};

export const autenticarComSenha = async () => {
  const resultado = await LocalAuthentication.authenticateAsync({
    promptMessage: 'Digite a senha do dispositivo para voltar ao modo de edição',
    cancelLabel: 'Cancelar',
  });
  return resultado.success;
};
