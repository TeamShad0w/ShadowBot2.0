import ClientWithCommands from './clientWithCommands';
import { Awaitable } from 'discord.js';

/**
 * The architecture of an event object (modules of the event/ directory).
 */
export default interface Ievent{
    listener : (bot:ClientWithCommands, ...args : any[]) => Awaitable<void>;
}