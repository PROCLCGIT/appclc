# Migración manual para añadir el modelo SecuenciaProforma
# Created: 2025-04-21

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('proformas', '0003_alter_proforma_numero'),
    ]

    operations = [
        migrations.CreateModel(
            name='SecuenciaProforma',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('anio', models.PositiveSmallIntegerField(unique=True, verbose_name='Año')),
                ('ultimo_numero', models.PositiveIntegerField(default=999, verbose_name='Último número utilizado')),
                ('ultima_actualizacion', models.DateTimeField(auto_now=True, verbose_name='Última actualización')),
            ],
            options={
                'verbose_name': 'Secuencia de Proforma',
                'verbose_name_plural': 'Secuencias de Proformas',
            },
        ),
        migrations.AddIndex(
            model_name='secuenciaproforma',
            index=models.Index(fields=['anio'], name='proformas_s_anio_65f04e_idx'),
        ),
    ]