import jinja2
from json_extraction import extract_json

def generate_eflint(interpretation: dict, template_path: str = "eflint_template.j2") -> str:
    
    frames = extract_json(interpretation)

    env = jinja2.Environment(
        loader=jinja2.FileSystemLoader("templates"),
        autoescape=False,
        trim_blocks=True,
        lstrip_blocks=True,
    )

    template = env.get_template(template_path)

    rendered = template.render(frames=frames)

    return rendered