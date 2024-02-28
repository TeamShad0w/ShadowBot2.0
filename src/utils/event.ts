import ClientWithCommands from './clientWithCommands';
import { Awaitable } from 'discord.js';

// TODO : jsDoc
export default interface Ievent{
    listener : (bot:ClientWithCommands, ...args : any[]) => Awaitable<void>;
}