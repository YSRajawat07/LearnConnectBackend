from django.db import models
from django.conf import settings

class Lecture(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    teacher = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    stream_url = models.URLField()
    topic = models.CharField(max_length=100)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    school = models.CharField(max_length=255, null=True, blank=True)
    branch = models.CharField(max_length=100, null=True, blank=True)
    semester = models.IntegerField(null=True, blank=True)
    is_live = models.BooleanField(default=False)
    start_time = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'lectures'
        ordering = ['-start_time']
