from rest_framework import serializers
from .models import Lecture

class LectureSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.username', read_only=True)
    dist = serializers.SerializerMethodField()  # Dynamically added field

    def get_dist(self, obj):
        return getattr(obj, "dist", None)  # Retrieve dynamically set `_distance`
    
    class Meta:
        model = Lecture
        fields = '__all__'
        read_only_fields = ('teacher', 'teacher_name', 'dist')
        extra_kwargs = {
            'school': {'required': False, 'allow_null': True},
            'branch': {'required': False, 'allow_null': True},
            'semester': {'required': False, 'allow_null': True},
            'latitude': {'required': False, 'allow_null': True},
            'longitude': {'required': False, 'allow_null': True},
            'start_time': {'required': False, 'allow_null': True}
        }

    def create(self, validated_data):
        validated_data['teacher'] = self.context['request'].user
        return super().create(validated_data)

