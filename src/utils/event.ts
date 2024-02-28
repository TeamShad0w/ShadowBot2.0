import ClientWithCommands from './clientWithCommands';
import { Awaitable } from 'discord.js';

export default interface Ievent{
    listener : (bot:ClientWithCommands, ...args : any[]) => Awaitable<void>;
}