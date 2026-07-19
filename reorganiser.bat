@echo off
echo Creation du dossier "autres_projets"...
mkdir autres_projets 2>nul

echo Deplacement des fichiers qui ne concernent pas le projet de l'eglise...
move m1.* autres_projets\
move multiplication.* autres_projets\
move vc140.pdb autres_projets\
move g-UI.html autres_projets\
move main.js autres_projets\
move modules autres_projets\
move .vscode autres_projets\

echo.
echo Reorganisation terminee. Appuyez sur une touche pour fermer.
pause
