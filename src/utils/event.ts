import ClientWithCommands from 'src/utils/clientWithCommands';
import { Awaitable } from 'discord.js';

export default interface Ievent{
    listener : (...args : any[]) => Awaitable<void>;
}