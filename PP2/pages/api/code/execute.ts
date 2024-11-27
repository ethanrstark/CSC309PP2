import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';


//exec wait statement
const waitexec = util.promisify(exec);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    //check for post only
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ message: 'Invalid Method' });
    }

    //get from req
    const { code, language, stdin } = req.body;

    //make sure language and code are provided
    if (!code || !language) {
        return res.status(400).json({ message: 'code and language fields are required' });
    }

    //check if code is empty then nothing to do
    if (code === '') {
        return res.status(200).json({ stdout: '', stderr: '' });
    }

    //make the temp directory
    const tmpDir = path.join('/tmp');
    if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir);
    }


    //create the input file if stdin is provided
    if(stdin){
        const inputpath = path.join('/tmp', 'input.txt');
        fs.writeFileSync(inputpath, stdin);
    }
    

    
    


    //create the filename depending on the language else case is php
    const filename = `script.${language === 'python' ? 'py' : language === 'javascript' ? 'js' : 
        language === 'typescript' ? 'ts' : language === 'c' ? 'c' : language === 'cpp' ? 'cpp' :
        language === 'ruby' ? 'rb' : language === 'go' ? 'go' : language === 'swift' ? 'swift' :
        language === 'java' ? 'java' : language === 'rust' ? 'rs' : 'php'}`;


    //file path for the file created under temp directory
    const filepath = path.join(tmpDir, filename);


    //add code to a tmp file
    fs.writeFileSync(filepath, code);

    //preapare for docker image and command
    let dockerImage = '';
    let dockerCommand = '';


    //cases for different languages
    switch (language) {

        case 'python':
            dockerImage = 'my-python-image';
            
            if(stdin){
                dockerCommand = `docker run --rm -v ${tmpDir}:/app ${dockerImage} sh -c "python /app/${filename} < /app/input.txt "`;
            }else{
                dockerCommand = `docker run --rm -v ${tmpDir}:/app ${dockerImage} sh -c "python /app/${filename}"`;
            }
            
            break;

        case 'javascript':
            dockerImage = 'my-javascript-image';
            if(stdin){
             
                dockerCommand = `docker run --rm -v ${tmpDir}:/app ${dockerImage} sh -c "node /app/${filename} < /app/input.txt"`;
            }else{
                dockerCommand = `docker run --rm -v ${tmpDir}:/app ${dockerImage} sh -c "node /app/${filename}"`;
            }
            break;

        case 'typescript':
            dockerImage = 'my-typescript-image';
            if(stdin){
                dockerCommand = `docker run --rm -v ${tmpDir}:/app ${dockerImage} sh -c "tsc /app/${filename} && node /app/script.js < /app/input.txt"`;
            }else{
                dockerCommand = `docker run --rm -v ${tmpDir}:/app ${dockerImage} sh -c "tsc /app/${filename} && node /app/script.js"`;
            }
            
            break;

        case 'java':
            dockerImage = 'my-java-image';

            //special case for java class name
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

            if(stdin){
                dockerCommand = `docker run --rm -v ${tmpDir}:/app ${dockerImage} sh -c "javac /app/${filename} && java -cp /app ${nowhitespace} < /app/input.txt"`;
            }else{
                dockerCommand = `docker run --rm -v ${tmpDir}:/app ${dockerImage} sh -c "javac /app/${filename} && java -cp /app ${nowhitespace}"`;
            }
            
            break;

        case 'cpp':
            dockerImage = 'my-cpp-image';
            if(stdin){
                dockerCommand = `docker run --rm -v ${tmpDir}:/app ${dockerImage} sh -c "g++ /app/${filename} -o /app/script && /app/script < /app/input.txt"`;
            }else{
                dockerCommand = `docker run --rm -v ${tmpDir}:/app ${dockerImage} sh -c "g++ /app/${filename} -o /app/script && /app/script"`;
            }
            
            break;

        case 'c':
            dockerImage = 'my-c-image';
            if(stdin){
                dockerCommand = `docker run --rm -v ${tmpDir}:/app ${dockerImage} sh -c "gcc /app/${filename} -o /app/script && /app/script < /app/input.txt"`;
            }else{
                dockerCommand = `docker run --rm -v ${tmpDir}:/app ${dockerImage} sh -c "gcc /app/${filename} -o /app/script && /app/script"`;
            }
            
            break;

        case 'ruby':
            dockerImage = 'my-ruby-image';

            if(stdin){
                dockerCommand = `docker run --rm -v ${tmpDir}:/app ${dockerImage} sh -c "ruby /app/${filename} < /app/input.txt"`;
            }else{
                dockerCommand = `docker run --rm -v ${tmpDir}:/app ${dockerImage} sh -c "ruby /app/${filename}"`;
            }
            
            break;

        case 'go':
            dockerImage = 'my-go-image';

            if(stdin){
                dockerCommand = `docker run --rm -v ${tmpDir}:/app ${dockerImage} sh -c "go run /app/${filename} < /app/input.txt"`;
            }else{
                dockerCommand = `docker run --rm -v ${tmpDir}:/app ${dockerImage} sh -c "go run /app/${filename}"`;
            }
            
            break;

        case 'swift':
            dockerImage = 'my-swift-image';

            if(stdin){
                dockerCommand = `docker run --rm -v ${tmpDir}:/app ${dockerImage} sh -c "swift /app/${filename} < /app/input.txt"`;
            }else{
                dockerCommand = `docker run --rm -v ${tmpDir}:/app ${dockerImage} sh -c "swift /app/${filename}"`;
            }
            
            break;

        case 'php':
            dockerImage = 'my-php-image';

            if(stdin){
                dockerCommand = `docker run --rm -v ${tmpDir}:/app ${dockerImage} sh -c "php /app/${filename} < /app/input.txt"`;
            }else{
                dockerCommand = `docker run --rm -v ${tmpDir}:/app ${dockerImage} sh -c "php /app/${filename}"`;
            }
            
            break;

        case 'rust':
            dockerImage = 'my-rust-image';

            if(stdin){
                //rust needs to remove the rs to run the file
                dockerCommand = `docker run --rm -v ${tmpDir}:/app ${dockerImage} sh -c "rustc /app/${filename} && /app/script < /app/input.txt"`;
            }else{
                dockerCommand = `docker run --rm -v ${tmpDir}:/app ${dockerImage} sh -c "rustc /app/${filename} && /app/script"`;
            }
            
            break


        //if doesnt match, then incorrect language
        default:

            return res.status(400).json({ message: 'Unsupported language' });

    }

    console.log(`Executing Docker command: ${dockerCommand}`);

    try {
        //execute the docker command in shell which runs docker image and command inside
        const { stdout, stderr } = await waitexec(dockerCommand);

        //clean up the temp files
        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
        }

        if (fs.existsSync('/tmp/input.txt')) {
            fs.unlinkSync('/tmp/input.txt');
        }

        //return the results
        return res.status(200).json({ stdout, stderr });

    } catch (error) {

        //if there is an error catch it
        const stderr = (error as any).stderr || (error as any).message;
        console.error('Error executing:', error);
        return res.status(400).json({ stderr });
    }
}