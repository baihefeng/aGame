/**
 * Created by neo.white on 2017/6/1.
 */
import { sayHello } from "./a";
function hello(compiler: string) {
    sayHello("TypeScript");
    console.log(`hot booting Hello from ${compiler}`);
}
hello('neo')

