import * as register from './auth/register';
import * as authenticate from './auth/authenticate';
import * as keyDerivation from './auth/keyDerivation';

export { register, authenticate, keyDerivation }

const webauthn = { register, authenticate, keyDerivation }
export default webauthn
