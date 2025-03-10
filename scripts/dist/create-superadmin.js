"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var bcryptjs_1 = __importDefault(require("bcryptjs"));
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var email, password, name_1, existingUser, hashedPassword_1, updatedUser, hashedPassword, newAdmin, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 7, 8, 10]);
                    console.log('Iniciando creación de usuario superadmin...');
                    email = 'superadmin@coparentalidad.com';
                    password = 'Admin123!';
                    name_1 = 'Super Administrador';
                    return [4 /*yield*/, prisma.user.findUnique({
                            where: { email: email }
                        })];
                case 1:
                    existingUser = _a.sent();
                    if (!existingUser) return [3 /*break*/, 4];
                    console.log('Ya existe un usuario con este email. Actualizando a rol ADMIN...');
                    return [4 /*yield*/, bcryptjs_1.default.hash(password, 10)];
                case 2:
                    hashedPassword_1 = _a.sent();
                    return [4 /*yield*/, prisma.user.update({
                            where: { email: email },
                            data: {
                                role: 'ADMIN',
                                name: name_1,
                                password: hashedPassword_1
                            }
                        })];
                case 3:
                    updatedUser = _a.sent();
                    console.log("Usuario actualizado con \u00E9xito: ".concat(updatedUser.email, " (").concat(updatedUser.role, ")"));
                    return [2 /*return*/];
                case 4: return [4 /*yield*/, bcryptjs_1.default.hash(password, 10)];
                case 5:
                    hashedPassword = _a.sent();
                    return [4 /*yield*/, prisma.user.create({
                            data: {
                                email: email,
                                name: name_1,
                                password: hashedPassword,
                                role: 'ADMIN'
                            }
                        })];
                case 6:
                    newAdmin = _a.sent();
                    console.log("Superadmin creado con \u00E9xito: ".concat(newAdmin.email, " (").concat(newAdmin.role, ")"));
                    console.log('Credenciales:');
                    console.log("- Email: ".concat(email));
                    console.log("- Contrase\u00F1a: ".concat(password));
                    console.log('Guarda estas credenciales en un lugar seguro.');
                    return [3 /*break*/, 10];
                case 7:
                    error_1 = _a.sent();
                    console.error('Error al crear superadmin:', error_1);
                    return [3 /*break*/, 10];
                case 8: return [4 /*yield*/, prisma.$disconnect()];
                case 9:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 10: return [2 /*return*/];
            }
        });
    });
}
main();
