#!/usr/bin/env python3

import sys, os 

def process(linesarr):
    content = []
    for i in linesarr:
        i = i.replace("\n", "")
        
        # inline comment
        if ("//" in i):
            i = i[:i.find("//")]
        
        # preprocessor macro
        # TODO handle #define macros
        if ("#" in i):
            continue
        
        # remove preceeding spaces
        while (len(i) > 0 and i[0] == ' '):
            i = i[1:]
        
        # omit empty lines
        if (i != ''):
            content.append(i)
    return content

def formatContent(type, content):
    formatted = type + " = \n"
    for i in content:
        formatted += "'" + i + "' + \n"
    formatted = formatted[:-4] + ";\n"
    return formatted

def writeToFile(vert, frag, projname):
    f = open(projname + ".js", "w")
    f.write(vert)
    f.write(frag)
    f.close()

def main():
    if (len(sys.argv) != 2):
        print(sys.argv)
        print("Usage: ./printShaders.py <proj_name>")
        sys.exit(1)

    projname = sys.argv[1]
    vertfilename = projname + ".vert"
    fragfilename = projname + ".frag"
    
    print("Projname: ", projname, "Shader files: ", vertfilename, fragfilename, "\n")

    vertcontent = fragcontent = None
    try:
        f = open(vertfilename, "r")
        vertcontent = f.readlines()
        f.close()

        f = open(fragfilename, "r")
        fragcontent = f.readlines()
        f.close()
    except Exception as e:
        print("Failed reading files", e)
        sys.exit(1)

    # process
    vertcontent = process(vertcontent)
    fragcontent = process(fragcontent)
    
    # print content in js file format
    vertcontent = formatContent("vert", vertcontent)
    fragcontent = formatContent("frag", fragcontent)

    # write content to file
    writeToFile(vertcontent, fragcontent, projname + "_shaders")

    return 0

main()
