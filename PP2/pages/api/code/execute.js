import { exec } from 'child_process';
import util from 'util'
import fs from 'fs';
import path from 'path';


//setup executre as a promise so we can wait for it
const waitexec = util.promisify(exec);


/**
 * The handler funciton for handling code execution
 * @param {*} req for request
 * @param {*} res for response
 * @returns the information for the code being executed
 * either stdout if it works or stderr if it fails
 */

export default async function handler(req, res) {

    //needs to be a post request
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ message: 'Invalid Method' });
    }

    //get the code the langugage and stdin(if it exists)
    const {code, language, stdin} = req.body;

    //code and language are required, stdin is not
    if (!code || !language) {
        return res.status(400).json({ message: 'code and language fields are required' });
    }

    //code can be blank
    //if code is blank should just return nothing, no file should be created
    if (code === '') {
        return res.status(200).json({ stdout: '', stderr: '' });
    }

    //create a tmp directory if it does not exist
    const tmpDir = path.join('/tmp');
    if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir);
    }

    //need to handle based on different languages
    if(language === 'python'){
        const filename = 'script.py';
        const filepath = path.join('/tmp', filename);
        fs.writeFileSync(filepath, code);
        const command = `python3 ${filepath}`;
        //for the input
        if (stdin){
            try{
                //create a file for the input
                const inputname = 'input.txt';
                const inputpath = path.join('/tmp', inputname);
                fs.writeFileSync(inputpath, stdin);
            
                //takes whatever stdin is and pipes it into the result of command
                const stdincommand = `${command} < ${inputpath}`;
                const {stdout, stderr} = await waitexec(stdincommand);

                //clean up the file
                if (fs.existsSync(filepath)) {
                    fs.unlinkSync(filepath);
                }

                //clean up input file
                if (fs.existsSync(inputpath)) {
                    fs.unlinkSync(inputpath);
                }

                return res.status(200).json({stdout, stderr});

            }catch(error){

                const stderr = error.stderr || error.message;
                console.error('Error executing:', error);
                return res.status(400).json({stderr});
            }

        }else{

            try{

                const {stdout, stderr} = await waitexec(command);

                //clean up the file
                if (fs.existsSync(filepath)) {
                    fs.unlinkSync(filepath);
                }

                return res.status(200).json({stdout, stderr});

            }catch(error){

                const stderr = error.stderr || error.message;
                console.error('Error executing:', error);
                return res.status(400).json({stderr});

            }
        }


    }else if(language === 'javascript'){
        const filename = 'script.js';
        const filepath = path.join('/tmp', filename);
        fs.writeFileSync(filepath, code);
        const command = `node ${filepath}`;
        if (stdin){

            try{

                //create a file for the input
                const inputname = 'input.txt';
                const inputpath = path.join('/tmp', inputname);
                fs.writeFileSync(inputpath, stdin);
                //takes whatever stdin is and pipes it into the result of command  
                const stdincommand = `${command} < ${inputpath}`;
                const {stdout, stderr} = await waitexec(stdincommand);

                //clean up the file
                if (fs.existsSync(filepath)) {
                    fs.unlinkSync(filepath);
                }

                //clean up inputpath
                if (fs.existsSync(inputpath)) {
                    fs.unlinkSync(inputpath);
                }

                return res.status(200).json({stdout, stderr});

            }catch(error){

                const stderr = error.stderr || error.message;
                console.error('Error executing:', error);
                return res.status(400).json({stderr});

            }

        }else{

            try{

                const {stdout, stderr} = await waitexec(command);
                if (fs.existsSync(filepath)) {
                    fs.unlinkSync(filepath);
                }

                return res.status(200).json({stdout, stderr});

            }catch(error){

                const stderr = error.stderr || error.message;
                console.error('Error executing:', error);
                return res.status(400).json({stderr});

            }

        }

    }else if(language === 'java'){
        const filename = 'script.java';
        //find the first instance of a public(optional) or class to define
        //what the file should be called when compiling since java follows this rule
        //public may or may not be there, if public is there we know the name of the file
        //if it is not we need this or it causes errors as it cant find the class
        const execfile = code.match(/(public\s)?class\s+(\w+)/);
        const execfilename = execfile[0];

        if(!execfilename){
            return res.status(400).json({message: 'error parsing java class name'});
        }

        //Need all checks below to get the name of java.class file so I can run it
        //get rid of public instanc
        const nopublic = execfilename.replace(/public/g, '');
        //get rid of class
        const noclass = nopublic.replace(/class/g, '');
        //get rid of whitespace
        const nowhitespace = noclass.replace(/\s/g, '');


        const filepath = path.join('/tmp', filename);
        const classpath = path.join('/tmp', nowhitespace);
        fs.writeFileSync(filepath, code);

        //for stdin
        const command1 = `javac ${filepath}`;
        const command2 = `java -cp /tmp ${nowhitespace}`;

        //for no stdin
        const command = `javac ${filepath} && java -cp /tmp ${nowhitespace}`;

        if (stdin){

            try{ 

                //create a file for the input
                const inputname = 'input.txt';
                const inputpath = path.join('/tmp', inputname);
                fs.writeFileSync(inputpath, stdin);

                //run the first command to first compile the java file
                await waitexec(command1);

                //now that it is ocmpiled we can run the second command
                const stdincommand = `${command2} < ${inputpath}`;

                const {stdout, stderr} = await waitexec(stdincommand);

                //for java file
                if (fs.existsSync(filepath)) {
                    fs.unlinkSync(filepath);
                }

                //for class file
                if (fs.existsSync(classpath)) {
                    fs.unlinkSync(classpath);
                }

                //for input file
                if (fs.existsSync(inputpath)) {
                    fs.unlinkSync(inputpath);
                }

                return res.status(200).json({stdout, stderr});

            }catch(error){

                const stderr = error.stderr || error.message;
                console.error('Error executing:', error);
                return res.status(400).json({stderr});

            }

        }else{

            try{

                const {stdout, stderr} = await waitexec(command);

                //clean up the file
                if (fs.existsSync(filepath)) {
                    fs.unlinkSync(filepath);
                }

                //clean up the class file
                if (fs.existsSync(classpath)) {
                    fs.unlinkSync(classpath);
                }

                return res.status(200).json({stdout, stderr});

            }catch(error){
                const stderr = error.stderr || error.message;
                console.error('Error executing:', error);
                return res.status(400).json({stderr});
            }

        }


    }else if(language === 'c'){
        const filename = 'script.c';
        const filepath = path.join('/tmp', filename);
        const execfile = 'script';
        fs.writeFileSync(filepath, code);


        //----for multiple input only
        const command1 = `gcc ${filepath} -o ${execfile}`;
        //then have command for running the file
        const command2 = `./${execfile}`;
        //----for multiple input only

        //when there is no input
        const command = `gcc ${filepath} -o ${execfile} && ./${execfile}`;
        if (stdin){

            try{

                //create a file for the input
                const inputname = 'input.txt';
                const inputpath = path.join('/tmp', inputname);
                fs.writeFileSync(inputpath, stdin);

                await waitexec(command1);
                const stdincommand = `${command2} < ${inputpath}`;
                const {stdout, stderr} = await waitexec(stdincommand);

                //clean up the file
                if (fs.existsSync(filepath)) {
                    fs.unlinkSync(filepath);
                }

                //clean up input file
                if (fs.existsSync(inputpath)) {
                    fs.unlinkSync(inputpath);
                }

                return res.status(200).json({stdout, stderr});

            }catch(error){

                const stderr = error.stderr || error.message;
                console.error('Error executing:', error);
                return res.status(400).json({stderr});

            }
            

        }else{

            try{

                const {stdout, stderr} = await waitexec(command);

                //clean up the file
                if (fs.existsSync(filepath)) {
                    fs.unlinkSync(filepath);
                }

                return res.status(200).json({stdout, stderr});

            }catch(error){

                const stderr = error.stderr || error.message;
                console.error('Error executing:', error);
                return res.status(400).json({stderr});

            }

        }

    }else if (language === 'cpp'){
        //case cpp if nothing else, double check this case.
        const filename = 'script.cpp';
        const execfile = 'script';
        const filepath = path.join('/tmp', filename);
        fs.writeFileSync(filepath, code);
        const command1 = `g++ ${filepath} -o ${execfile}`;
        const command2 = `./${execfile}`;
        const command = `g++ ${filepath} -o ${execfile} && ./${execfile}`;

        if (stdin){
            
            try{

                //create a file for the input
                const inputname = 'input.txt';
                const inputpath = path.join('/tmp', inputname);
                fs.writeFileSync(inputpath, stdin);

                //takes whatever stdin is and pipes it into the result of command
                await waitexec(command1);
                const stdincommand = `${command2} < ${inputpath}`;
                const {stdout, stderr} = await waitexec(stdincommand);

                //clean up the file
                if (fs.existsSync(filepath)) {
                    fs.unlinkSync(filepath);
                }

                //clean up input file
                if (fs.existsSync(inputpath)) {
                    fs.unlinkSync(inputpath);
                }

                return res.status(200).json({stdout, stderr});

            }catch(error){

                const stderr = error.stderr || error.message;
                console.error('Error executing:', error);
                return res.status(400).json({stderr});

            }

        }else{

            try{

                const {stdout, stderr} = await waitexec(command);

                //clean up the file
                if (fs.existsSync(filepath)) {
                    fs.unlinkSync(filepath);
                }

                return res.status(200).json({stdout, stderr});

            }catch(error){

                const stderr = error.stderr || error.message;
                console.error('Error executing:', error);
                return res.status(400).json({stderr});

            }

        }


    }else{
        //case the languges isnt one of the 5 supported
        return res.status(400).json({message: 'Unsupported language'});
    }


}