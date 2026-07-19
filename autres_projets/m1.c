#include <stdio.h>
#include <stdlib.h>

void tableDeMultiplication (int a, int b)
{
    int res, i, j, debut, fin;
    debut = 0;
    fin = 0;
    if (a < b)
    {
        debut = a;
        fin = b;
    }
    else
    {
        debut = b;
        fin = a;
    }
    for (i = debut; i <= fin; i++)
    {
        printf("\n--- Table de %d ---\n", i);
        for (j = 1; j <= 10; j++)
        {
            res = i * j;
            printf("%d x %d = %d\n", i, j, res);
        }
    }
    return;
}
int main()
{
    int rep;
    do
    {

        int n1, n2;
        printf("Bonjour & Bienvenue dans le programme 'TABLES DE MULTIPLICATION PAR INTERVALLE'\n");
        printf("----------------------------------------------------------------------------\n");

        printf("Entrez le premier nombre : ");
        scanf("%d", &n1);
        printf("Entrez le second nombre : ");
        scanf("%d", &n2);



        printf("\nAffichage des tables de multiplication de %d a %d :\n", n1, n2);

        tableDeMultiplication(n1, n2);
        printf("Voulez-vous continuer !? Tapez 1 pour OUI & 2 pour Non");
        scanf("%d", &rep);

    }while (rep==1);
    
    
    printf("\n----------------------------------------------------\n");
    printf("Fin du programme. Merci !\n");


    return 0;
}
